package data

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"

	"github.com/sfomuseum/go-accession-numbers"
)

//go:embed *.json
var FS embed.FS

func LoadDefinitions() ([]*accessionnumbers.Definition, error) {

	defs := make([]*accessionnumbers.Definition, 0)

	walk_func := func(path string, d fs.DirEntry, err error) error {

		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		r, err := FS.Open(path)

		if err != nil {
			return fmt.Errorf("Failed to open %s for reading, %w", path, err)
		}

		defer r.Close()

		var def *accessionnumbers.Definition

		dec := json.NewDecoder(r)
		err = dec.Decode(&def)

		if err != nil {
			return fmt.Errorf("Failed to decode %s, %w", path, err)
		}

		defs = append(defs, def)
		return nil
	}

	err := fs.WalkDir(FS, ".", walk_func)

	if err != nil {
		return nil, err
	}

	return defs, nil
}
