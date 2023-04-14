import React from "react";
import ReactDOM from "react-dom";
import { Container, Card } from "semantic-ui-react";

import { PurrSettingsCard } from "./purr.sc";
import { PurrAbstractBooklet } from "./purr.ab";
import { PurrPapersChecks } from "./purr.pc";
import { PurrFinalProceedings } from "./purr.fp";

document.addEventListener("DOMContentLoaded", () => {

    const PurrHome = ({ children }) => (
        <Container fluid>
            {children}
        </Container>
    );

    ReactDOM.render(
        <PurrHome>
            <Card.Group>
                <PurrSettingsCard />
                <PurrAbstractBooklet />
                <PurrPapersChecks />
                <PurrFinalProceedings />
            </Card.Group>
        </PurrHome>,
        document.getElementById("purr-spa")
    )
    
});
