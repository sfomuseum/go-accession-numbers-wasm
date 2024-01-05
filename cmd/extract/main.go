package main

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"syscall/js"

	"github.com/sfomuseum/go-accession-numbers"
)

func ExtractFunc() js.Func {

	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {

		text := args[0].String()
		enc_defs := args[1].String()

		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {

			resolve := args[0]
			reject := args[1]

			var defs []*accessionnumbers.Definition

			r := strings.NewReader(enc_defs)

			dec := json.NewDecoder(r)
			err := dec.Decode(&defs)

			if err != nil {
				reject.Invoke(fmt.Printf("Failed to decode definitions, %v\n", err))
				return nil
			}

			matches, err := accessionnumbers.ExtractFromText(text, defs...)

			if err != nil {
				reject.Invoke(fmt.Printf("Failed to extract from text, %v\n", err))
				return nil
			}

			enc, err := json.Marshal(matches)

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

	func_name := "accession_numbers_extract"

	extract_func := ExtractFunc()
	defer extract_func.Release()

	js.Global().Set(func_name, extract_func)

	c := make(chan struct{}, 0)

	log.Printf("WASM '%s' function initialized", func_name)
	<-c
}
