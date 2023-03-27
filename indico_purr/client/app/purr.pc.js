import React, { useState } from 'react';
import { Button, Card, Icon } from 'semantic-ui-react'

export const PurrPapersChecks = () => {

    const [loading, setLoading] = useState(false);

    const check = () => {
        setLoading(!loading)
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    Papers Check
                </Card.Header>
                <Card.Meta>
                    Click "Check" button to act papers checks.
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
                    <Button onClick={check} primary compact size='mini'
                        labelPosition='right' icon='right chevron' content='Check' />
                </div>
            </Card.Content>
        </Card>
    )
}

