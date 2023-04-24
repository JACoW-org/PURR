import { capitalize, first, flow, join, map, slice, split } from 'lodash'

export function buildAttachmentView(attachment) {

    const extractMeta = flow(
        filename => split(filename, '.'),       // split by '.'
        root => first(root),                    // get the root only
        value => split(value, '-'),             // split by '-' 
        tokens => slice(tokens, 3),             // keep tokens from index 3
        metaTokens => map(metaTokens, token => capitalize(token)),   // capitalize first letters
        metaTokens => join(metaTokens, ' ')     // join back the tokens
    )(attachment.filename);

    return {
        title: attachment.title,
        filename: attachment.filename,
        scope: extractMeta
    }
}