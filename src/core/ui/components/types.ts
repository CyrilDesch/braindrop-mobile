export interface FABAction {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  color?: string;
}
