GOMOD=$(shell test -f "go.work" && echo "readonly" || echo "vendor")
LDFLAGS=-s -w

wasip:
	GOARCH=wasm GOOS=wasip1 go build -mod $(GOMOD) -ldflags="$(LDFLAGS)" -o www/wasip/extract.wasm ./cmd/extract-wasi/main.go
	GOARCH=wasm GOOS=wasip1 go build -mod $(GOMOD) -ldflags="$(LDFLAGS)" -o www/wasip/definitions.wasm ./cmd/definitions-wasi/main.go

wasm:
	GOOS=js GOARCH=wasm go build -mod $(GOMOD) -ldflags="$(LDFLAGS)" -o www/wasm/extract.wasm cmd/extract/main.go
	GOOS=js GOARCH=wasm go build -mod $(GOMOD) -ldflags="$(LDFLAGS)" -o www/wasm/definitions.wasm cmd/definitions/main.go

server:
	go run -mod $(GOMOD) cmd/server/main.go
