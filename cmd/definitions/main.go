package main

import (
	"encoding/json"
	"fmt"
	"log"
	"syscall/js"

	"github.com/sfomuseum/go-accession-numbers-wasm/static/data"
)

func DefinitionsFunc() js.Func {
	
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {

		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {

			resolve := args[0]
			reject := args[1]

			defs, err := data.LoadDefinitions()
			
			if err != nil {
				reject.Invoke(fmt.Printf("Failed to load definitions, %v\n", err))
				return nil
			}

			enc, err := json.Marshal(defs)

			if err != nil {
				reject.Invoke(fmt.Printf("Failed to marshal result, %v\n", err))
				return nil
			}

			resolve.Invoke(string(enc))
			return nil
		})

		promiseConstructor := js.Global().Get("Promise")
		return promiseConstructor.New(handler)
	})
}

func main() {

	func_name := "accession_numbers_definitions"
	
	definitions_func := DefinitionsFunc()
	defer definitions_func.Release()

	js.Global().Set(func_name, definitions_func)

	c := make(chan struct{}, 0)

	log.Printf("WASM '%s' function initialized", func_name)	
	<-c
}
