import * as migration_20261015_000443_inicial from './20261015_000443_inicial';
import * as migration_20261015_223515_disponibilidade from './20261015_223515_disponibilidade';
import * as migration_20261016_210352_foto_perfil from './20261016_210352_foto_perfil';
import * as migration_20261020_001610_gestao_cargo_lista from './20261020_001610_gestao_cargo_lista';
import * as migration_20261021_235736_rotulos_quem_somos from './20261021_235736_rotulos_quem_somos';

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
    name: '20261016_210352_foto_perfil',
  },
  {
    up: migration_20261020_001610_gestao_cargo_lista.up,
    down: migration_20261020_001610_gestao_cargo_lista.down,
    name: '20261020_001610_gestao_cargo_lista',
  },
  {
    up: migration_20261021_235736_rotulos_quem_somos.up,
    down: migration_20261021_235736_rotulos_quem_somos.down,
    name: '20261021_235736_rotulos_quem_somos'
  },
];
