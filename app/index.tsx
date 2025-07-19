import { Redirect } from "expo-router";
import { ROOT_ROUTE } from "src/routes/routes";

export default function App() {
  return <Redirect href={ROOT_ROUTE} />;
}
