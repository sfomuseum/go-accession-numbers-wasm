package main

import (
	"context"
	"flag"
	"log"
	
	"github.com/sfomuseum/go-accession-numbers-wasm/www"
	"github.com/sfomuseum/go-http-wasm/v2/server"		
)

func main() {

	server_uri := flag.String("server-uri", "http://localhost:8080", "A valid aaronland/go-http-server URI.")

	flag.Parse()

	ctx := context.Background()

	err := server.ServeWithFS(ctx, *server_uri, www.FS)

	if err != nil {
		log.Fatalf("Failed to run WASM server application, %v", err)
	}
}
