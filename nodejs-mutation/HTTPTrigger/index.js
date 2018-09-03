const { query } = require('graphqurl');
const ACCESS_KEY = process.env.X_HASURA_ACCESS_KEY;
const HASURA_GRAPHQL_ENGINE_URL = process.env.HASURA_GRAPHQL_ENGINE_URL;
const MUTATION_NOTE_REVISION = `
mutation updateNoteRevision ($noteId: Int!, $data: String!) {
  insert_note_revision (objects: [
    {
      note_id: $noteId,
      note: $data
    }
  ]) {
    affected_rows
  }
}
`;

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    try {
        const { op, data, table, schema } = req.body;
        context.log(data);
        context.log(data.new.id);
        const qv = {noteId: data.new.id, data: data.new.note};
        const hgeResponse = query({
              query: MUTATION_NOTE_REVISION,
              endpoint: HASURA_GRAPHQL_ENGINE_URL,
              variables: qv,
              /*
              headers: {
                'x-hasura-access-key': ACCESS_KEY
              }
              */
        }).then((response) => {
            context.log(response);
            context.log('After query');
            context.res = {
                body: {
                    error: false, 
                    data: JSON.stringify(response)
                }
            };
        }).catch((error) => {
            console.error(JSON.stringify(error));
            context.res = {
                body: {
                    error: true, 
                    data: JSON.stringify(error)
                }
            };
        });
    } catch(e) {
        context.res = {
            status: 400,
            body: "An error occured."
        };
    }
    context.done();
};
