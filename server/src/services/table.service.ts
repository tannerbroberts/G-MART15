import pool from '../database/pool';

export const TableService = {
  async getTableState(tableId: string) {
    const [tables]: any = await pool.execute(
      'SELECT * FROM blackjack_tables WHERE id = ?',
      [tableId]
    );

    const [players]: any = await pool.execute(
      'SELECT * FROM players WHERE table_id = ?',
      [tableId]
    );

    return {
      ...tables[0],
      players,
      isGameActive: Boolean(tables[0]?.current_hand_id)
    };
  }
};
