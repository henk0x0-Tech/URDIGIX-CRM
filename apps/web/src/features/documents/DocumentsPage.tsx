import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { documentService } from '../../services/dataService';
import { Plus, Folder, File, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getAll();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName) return;
    try {
      await documentService.createFolder(folderName);
      toast.success('Folder created successfully!');
      setIsFolderModalOpen(false);
      setFolderName('');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to create folder.');
    }
  };

  const handleFileUpload = () => {
    toast.success('File upload trigger simulation.');
  };

  const handleDelete = async (id: string) => {
    try {
      await documentService.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success('Document deleted.');
    } catch (error) {
      toast.error('Failed to delete document.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Documents"
        description="Share, upload, and store files, statements, and handbooks securely"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsFolderModalOpen(true)} icon={<Plus className="h-4 w-4" />}>
              New Folder
            </Button>
            <Button onClick={handleFileUpload} icon={<Upload className="h-4 w-4" />}>
              Upload File
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} hoverEffect className="flex flex-col justify-between p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${doc.type === 'folder' ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/10' : 'bg-blue-50 text-blue-500 dark:bg-blue-500/10'}`}>
                  {doc.type === 'folder' ? <Folder className="h-5 w-5" /> : <File className="h-5 w-5" />}
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-bold text-slate-800 dark:text-white text-sm truncate">{doc.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{doc.type === 'folder' ? 'Folder' : `${(doc.size / 1024 / 1024).toFixed(2)} MB`}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px] text-slate-400 font-semibold">
                <span>By: {doc.uploadedByName}</span>
                <button onClick={() => handleDelete(doc.id)} className="text-rose-500 hover:text-rose-600 p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Folder Modal */}
      <Modal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} title="Create New Folder" size="sm">
        <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
          <Input label="Folder Name" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="e.g. Design, Invoices" required />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" type="button" onClick={() => setIsFolderModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Folder</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DocumentsPage;
