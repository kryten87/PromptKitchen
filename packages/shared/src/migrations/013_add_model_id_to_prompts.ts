import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('prompts');
  if (exists) {
    await knex.schema.table('prompts', (table) => {
      table.string('model_id').references('id').inTable('models').onDelete('SET NULL');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('prompts');
  if (tableExists) {
    // Check if the column exists before dropping
    const columns = await knex('prompts').columnInfo();
    if ('model_id' in columns) {
      await knex.schema.table('prompts', (table) => {
        table.dropColumn('model_id');
      });
    }
  }
}
