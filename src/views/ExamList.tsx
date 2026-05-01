import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  Trash2,
  Clock,
  Hash,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { format } from 'date-fns';

export const ExamList: React.FC = () => {
  const { exams, deleteExam, setActiveExam, setView } = useExamStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleStart = (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;
    setActiveExam(exam);
    setView('exam-mode');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteExam(deleteId);
      setDeleteId(null);
    }
  };

  const getTypeBreakdown = (exam: (typeof exams)[0]) => {
    const counts = { mcq: 0, subjective: 0, numerical: 0 };
    exam.questions.forEach((q) => counts[q.type]++);
    return counts;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {exams.length} exam{exams.length !== 1 ? 's' : ''} in your library
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => setView('create-exam')}
        >
          Create Exam
        </Button>
      </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-gray-700" />
          </div>
          <h3 className="text-base font-semibold text-gray-300 mb-2">No exams yet</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-xs">
            Create your first exam paper to start training under real pressure.
          </p>
          <Button variant="primary" icon={<Plus size={15} />} onClick={() => setView('create-exam')}>
            Create Your First Exam
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const types = getTypeBreakdown(exam);
            const totalMarks = exam.questions.reduce((s, q) => s + q.marks, 0);
            return (
              <Card key={exam.id} hover className="flex flex-col">
                <CardBody className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-violet-600/15 rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-100 leading-snug">{exam.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Created {format(new Date(exam.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant="violet">{exam.subject}</Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-gray-600" />
                      {Math.floor(exam.totalTime / 60)} min
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Hash size={12} className="text-gray-600" />
                      {exam.questions.length} questions
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">•</span>
                      {totalMarks} marks
                    </div>
                  </div>

                  {/* Type breakdown */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {types.mcq > 0 && <Badge variant="violet">{types.mcq} MCQ</Badge>}
                    {types.subjective > 0 && <Badge variant="blue">{types.subjective} Subjective</Badge>}
                    {types.numerical > 0 && <Badge variant="green">{types.numerical} Numerical</Badge>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Play size={13} />}
                      className="flex-1"
                      onClick={() => handleStart(exam.id)}
                    >
                      Start Exam
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={13} />}
                      onClick={() => setDeleteId(exam.id)}
                      className="text-gray-600 hover:text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Exam"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle size={18} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-300">
                Are you sure you want to delete this exam? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
