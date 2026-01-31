/**
 * Marcas, modelos por marca e cores para dropdowns (Meu Carro).
 * Mercado brasileiro – dados iniciais; pode ser expandido ou trocado por API.
 */

export const MARCAS = [
  'Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Nissan', 'Renault',
  'Toyota', 'Volkswagen', 'BYD', 'CAOA Chery', 'Citroën', 'Peugeot', 'JAC',
] as const;

export type Marca = (typeof MARCAS)[number];

export const MODELOS_POR_MARCA: Record<string, string[]> = {
  Chevrolet: ['Onix', 'Onix Plus', 'Tracker', 'Prisma', 'Spin', 'S10', 'Cruze', 'Equinox', 'Montana', 'Captiva', 'Cruze Sport6', 'Tracker RS'],
  Fiat: ['Argo', 'Mobi', 'Cronos', 'Strada', 'Toro', 'Pulse', 'Fiorino', 'Ducato', '500', 'Uno', 'Grand Siena', 'Linea'],
  Ford: ['Ka', 'Ka Sedan', 'EcoSport', 'Ranger', 'Territory', 'Maverick', 'Focus', 'Fusion', 'Mustang'],
  Honda: ['Fit', 'City', 'HR-V', 'WR-V', 'Civic', 'Accord', 'CR-V', 'Honda e'],
  Hyundai: ['HB20', 'HB20S', 'Creta', 'ix35', 'Tucson', 'Santa Fe', 'Porter', 'Azera', 'Elantra'],
  Jeep: ['Compass', 'Renegade', 'Commander', 'Grand Cherokee', 'Wrangler'],
  Nissan: ['Kicks', 'Versa', 'March', 'Sentra', 'Frontier', 'Livina', 'GT-R', 'Leaf'],
  Renault: ['Kwid', 'Sandero', 'Stepway', 'Logan', 'Duster', 'Oroch', 'Captur', 'Megane', 'Clio'],
  Toyota: ['Corolla', 'Corolla Cross', 'Hilux', 'Yaris', 'SW4', 'RAV4', 'Etios', 'Prius', 'Camry'],
  Volkswagen: ['Gol', 'Polo', 'Virtus', 'T-Cross', 'Nivus', 'Taos', 'Saveiro', 'Amarok', 'Jetta', 'Tiguan', 'Up!', 'Fox', 'Voyage'],
  BYD: ['Dolphin', 'Yuan Plus', 'Song Plus', 'Han', 'Tang', 'Seal'],
  'CAOA Chery': ['Tiggo 5X', 'Tiggo 7', 'Tiggo 8', 'Arrizo 6', 'iCar'],
  Citroën: ['C3', 'C4 Cactus', 'Aircross', 'C4 Lounge', 'C5 Aircross'],
  Peugeot: ['208', '2008', '308', '3008', '5008', 'Partner'],
  JAC: ['T40', 'T50', 'T60', 'T80', 'J3', 'J5', 'J6'],
};

export const CORES = [
  'Amarelo', 'Azul', 'Bege', 'Bordô', 'Branco', 'Bronze', 'Chumbo', 'Cinza',
  'Dourado', 'Laranja', 'Marrom', 'Prata', 'Preto', 'Verde', 'Vermelho', 'Vinho',
] as const;

export type Cor = (typeof CORES)[number];

export function getModelosByMarca(marca: string): string[] {
  return MODELOS_POR_MARCA[marca] ?? [];
}
