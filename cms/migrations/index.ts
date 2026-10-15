import * as migration_20261014_235310_inicial from './20261014_235310_inicial';

export const migrations = [
  {
    up: migration_20261014_235310_inicial.up,
    down: migration_20261014_235310_inicial.down,
    name: '20261014_235310_inicial'
  },
];
