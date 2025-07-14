type Gradient = readonly [string, string];

export interface BusinessTypeOption {
  key: string;
  label: string;
  iconName: string;
  gradient: Gradient;
}

export const businessTypes: BusinessTypeOption[] = [
  { key: 'public', label: 'Обществено', iconName: 'Building', gradient: ['#10B981', '#34D399'] as const },
  { key: 'restaurant', label: 'Ресторант', iconName: 'Utensils', gradient: ['#F59E0B', '#FBBF24'] as const },
  { key: 'cafe', label: 'Кафе', iconName: 'Coffee', gradient: ['#8B5CF6', '#A78BFA'] as const },
  { key: 'bar', label: 'Бар', iconName: 'Users', gradient: ['#EF4444', '#F87171'] as const },
  { key: 'gas_station', label: 'Бензиностанция', iconName: 'Fuel', gradient: ['#06B6D4', '#22D3EE'] as const },
  { key: 'mall', label: 'Мол', iconName: 'ShoppingBag', gradient: ['#EC4899', '#F472B6'] as const },
];

export const availableAmenities = [
  { name: 'Тоалетна хартия', iconName: 'Droplets', color: '#06B6D4' },
  { name: 'Сапун', iconName: 'Droplets', color: '#10B981' },
  { name: 'Дезинфектант', iconName: 'Shield', color: '#8B5CF6' },
  { name: 'Сешоар', iconName: 'Wind', color: '#F59E0B' },
  { name: 'Огледало', iconName: 'Eye', color: '#6B7280' },
  { name: 'Пеленачка', iconName: 'Baby', color: '#EC4899' },
  { name: 'Климатик', iconName: 'Wind', color: '#06B6D4' },
  { name: 'Музика', iconName: 'Music', color: '#8B5CF6' },
  { name: 'WiFi', iconName: 'Wifi', color: '#10B981' },
  { name: 'Паркинг', iconName: 'Car', color: '#F59E0B' },
];
