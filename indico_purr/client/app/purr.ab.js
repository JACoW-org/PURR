import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Icon } from 'semantic-ui-react'

import { getSettings, download, openSocket, fetchJson, runPhase } from './purr.lib';

export const PurrAbstractBooklet = () => {

    const [settings] = useState(() => getSettings());
    const [loading, setLoading] = useState(() => false);

    const onDownload = useCallback(() => setLoading(true), []);

    useEffect(() => {
        if (settings && loading) {

            const [task_id, socket] = openSocket(settings);

            const actions = {
                'task:result': (head, body) => download(body),
            };

            socket.subscribe({
                next: ({ head, body }) => runPhase(head, body, actions, socket),
                complete: () => setLoading(false),
                error: err => {
                    console.error(err);
                    setLoading(false);
                }
            });

            fetchJson('event-abstract-booklet')
                .subscribe(({ error, result }) => error
                    ? socket.complete()
                    : socket.next({
                        head: {
                            code: `task:exec`,
                            uuid: task_id
                        },
                        body: {
                            method: `event_ab`,
                            params: result,
                        },
                    })
                );
        }

        return () => console.log('destroy');

    }, [settings, loading]);


    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    Abstract Booklet
                </Card.Header>
                <Card.Meta>
                    Click "Download" button to download the Abstract Booklet document.
                </Card.Meta>
            </Card.Content>

            <Card.Content extra>
                <div className='ui left'>
                    {loading ? (
                        <div>
                            <Icon loading name='spinner' />
                            Processing...
                        </div>
                    ) : (
                        <div>
                            <Icon name='plug' />
                            Ready.
                        </div>
                    )}
                </div>
                <div className='ui right'>
                    <Button onClick={onDownload} loading={loading}
                        disabled={loading} primary compact size='mini'
                        icon='right chevron' content='Download' />
                </div>
            </Card.Content>
        </Card>
    )
}

