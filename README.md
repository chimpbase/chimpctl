# chimpctl

Customer CLI for [Chimpbase Cloud](https://chimpbase.dev).

## Install

Single-binary (recommended):

```
# macOS (Apple Silicon)
curl -fsSL https://chimpbase.dev/install.sh | sh

# Or download from GitHub Releases:
# https://github.com/chimpbase/chimpctl/releases
```

Or via a package manager once we publish:

```
npm i -g chimpctl
bun add -g chimpctl
```

## Quickstart

```
chimpctl login            # GitHub device flow → API key
chimpctl init             # create chimpbase.config.ts in the current dir
chimpctl deploy           # bundle, upload, deploy
chimpctl logs --follow    # tail logs
```

## Commands (planned)

`login`, `logout`, `whoami`, `init`, `deploy`, `logs`, `env`, `secrets`,
`domains`, `scale`, `rollback`, `status`, `open`, `projects`.

Current skeleton only wires `--version` and `--help`.

## License

Apache-2.0. See `LICENSE`.
