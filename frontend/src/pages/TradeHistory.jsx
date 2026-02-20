import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTrading } from '../context/TradingContext';

export default function TradeHistory() {
  const { transactions, addJournalNote } = useTrading();
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const handleViewJournal = (transaction) => {
    setSelectedTransaction(transaction);
    setJournalEntry(transaction.journalNote || '');
    setIsEditMode(!transaction.journalNote);
    setJournalModalOpen(true);
  };

  const handleSaveJournal = () => {
    if (selectedTransaction) {
      addJournalNote(selectedTransaction.id, journalEntry);
      setJournalModalOpen(false);
      setSelectedTransaction(null);
      setJournalEntry('');
      setIsEditMode(false);
    }
  };

  const handleCloseModal = () => {
    setJournalModalOpen(false);
    setSelectedTransaction(null);
    setJournalEntry('');
    setIsEditMode(false);
  };

  const handleEditJournal = () => {
    setIsEditMode(true);
  };

  return (
    <div className="page">
      <h1 className="page-title">Trade History</h1>
      <div className="page-content">
        <Card>
          {transactions.length === 0 ? (
            <p className="empty-state">No transactions yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Stock</th>
                    <th>Type</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((trade) => (
                    <tr key={trade.id}>
                      <td>{trade.date}</td>
                      <td className="font-weight-600">{trade.symbol}</td>
                      <td>
                        <span className={`badge ${trade.type === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="text-right">{trade.quantity}</td>
                      <td className="text-right">${Number(trade.price).toFixed(2)}</td>
                      <td>
                        <Button
                          variant="secondary"
                          className="btn-sm"
                          onClick={() => handleViewJournal(trade)}
                        >
                          {trade.journalNote ? 'View Journal' : 'Journal'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={journalModalOpen}
        onClose={handleCloseModal}
        title="Trade Journal Entry"
      >
        {selectedTransaction?.journalNote && !isEditMode ? (
          <div className="journal-view">
            <p className="journal-note-text">{selectedTransaction.journalNote}</p>
            <div className="modal-actions">
              <Button variant="secondary" onClick={handleEditJournal}>
                Edit
              </Button>
              <Button variant="primary" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <textarea
              className="journal-textarea"
              placeholder="Write your trade notes here..."
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              rows={6}
            />
            <div className="modal-actions">
              <Button variant="primary" onClick={handleSaveJournal} className="modal-footer-btn">
                Save
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
