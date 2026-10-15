import * as migration_20261015_000443_inicial from './20261015_000443_inicial';

export const migrations = [
  {
    up: migration_20261015_000443_inicial.up,
    down: migration_20261015_000443_inicial.down,
    name: '20261015_000443_inicial'
  },
];
