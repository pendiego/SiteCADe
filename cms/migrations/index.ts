import * as migration_20261015_000443_inicial from './20261015_000443_inicial';
import * as migration_20261015_223515_disponibilidade from './20261015_223515_disponibilidade';

export const migrations = [
  {
    up: migration_20261015_000443_inicial.up,
    down: migration_20261015_000443_inicial.down,
    name: '20261015_000443_inicial',
  },
  {
    up: migration_20261015_223515_disponibilidade.up,
    down: migration_20261015_223515_disponibilidade.down,
    name: '20261015_223515_disponibilidade'
  },
];
