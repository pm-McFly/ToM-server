{
  description = "tom-server dev env";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachSystem [ "x86_64-linux" ] (system:
      let
        pkgs = import nixpkgs {
          inherit system;

          config.allowUnfree = true;
        };
      in
      {
        devShell = with pkgs; mkShell rec {
          # ENV_VAR_NAME = "value";

          # Packages to install
          buildInputs = [
            nodejs
            typescript

            # utils
            npm-check
            npm-check-updates
            npm-lockfile-fix
            typescript-language-server
          ];

          # Run this at start
          shellHook = ''
            echo
            echo "node version: $(node -v)"
            echo "npm version: $(npm -v)"
            echo
          '';
        };
      }
    );
}
