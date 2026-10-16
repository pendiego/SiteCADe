import * as migration_20261015_000443_inicial from './20261015_000443_inicial';
import * as migration_20261015_223515_disponibilidade from './20261015_223515_disponibilidade';
import * as migration_20261016_210352_foto_perfil from './20261016_210352_foto_perfil';

export const migrations = [
  {
    up: migration_20261015_000443_inicial.up,
    down: migration_20261015_000443_inicial.down,
    name: '20261015_000443_inicial',
  },
  {
    up: migration_20261015_223515_disponibilidade.up,
    down: migration_20261015_223515_disponibilidade.down,
    name: '20261015_223515_disponibilidade',
  },
  {
    up: migration_20261016_210352_foto_perfil.up,
    down: migration_20261016_210352_foto_perfil.down,
    name: '20261016_210352_foto_perfil'
  },
];
