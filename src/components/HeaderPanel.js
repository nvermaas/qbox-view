import React from 'react';
import { Card  } from 'react-bootstrap';
import logo from '../my_energy.jpg';

export default function HeaderPanel() {
    return (
        <div>
            <Card border="info" >
                <Card.Header>
                    <Card.Title as="h2">
                        <img  src={logo} alt="Logo" width="40" /> MyEnergy
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Version 1.6.1 - 26 jan 2020</Card.Subtitle>
                </Card.Header>
            </Card>
        </div>
    );
}
