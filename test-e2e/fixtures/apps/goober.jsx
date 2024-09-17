import "preact/devtools";
import { h, render } from "preact";
import { createContext, useContext } from "preact/compat";
import { setup, styled } from "goober";

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

setup(h, undefined, useTheme);

const StyledButton = styled("button")({
	background: "#fd9",
	border: "1px solid #ddd",
	borderRadius: "4px",
	padding: "4px 8px",
});

function Button() {
	return <StyledButton>Inspect me</StyledButton>;
}

render(<Button />, document.getElementById("app"));
