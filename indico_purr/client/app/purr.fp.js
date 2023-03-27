import React, { useState } from 'react';
import { Button, Card, Icon } from 'semantic-ui-react'

export const PurrFinalProceedings = () => {

    const [loading, setLoading] = useState(false);

    const generate = () => {
        setLoading(!loading)
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    Final Proceedings
                </Card.Header>
                <Card.Meta>
                    Click "Generate" button to download Final Proceedings
                </Card.Meta>
            </Card.Content>

            <Card.Content extra>
                <div className='ui left'>
                    {(loading ? (
                        <div>
                            <Icon loading name='spinner' />
                            Processing...
                        </div>
                    ) : (
                        <div>
                            <Icon name='plug' />
                            Ready.
                        </div>
                    ))}
                </div>
                <div className='ui right'>
                    <Button onClick={generate} primary compact size='mini'
                        labelPosition='right' icon='right chevron' content='Generate' />
                </div>
            </Card.Content>
        </Card>
    )
}

