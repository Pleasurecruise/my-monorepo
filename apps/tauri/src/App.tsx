import { useState } from "react";
import { Button } from "@my-monorepo/ui/components/button";

function App() {
	const [count, setCount] = useState(0);

	return (
		<main className="flex min-h-screen items-center justify-center">
			<Button type="button" onClick={() => setCount((c) => c + 1)}>
				Add 1 to {count}?
			</Button>
		</main>
	);
}

export default App;
