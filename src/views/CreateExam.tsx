import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  BookOpen,
  ListChecks,
  FileText,
  Hash,
} from 'lucide-react';
import { useExamStore } from '../store/examStore';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { Question, QuestionType, MCQOption, Exam } from '../types';

const defaultQuestion = (): Question => ({
  id: uuidv4(),
  type: 'mcq',
  text: '',
  options: [
    { id: 'a', text: '' },
    { id: 'b', text: '' },
    { id: 'c', text: '' },
    { id: 'd', text: '' },
  ],
  correctAnswer: 'a',
  marks: 4,
  subject: '',
});

const typeIcons: Record<QuestionType, React.ReactNode> = {
  mcq: <ListChecks size={14} />,
  subjective: <FileText size={14} />,
  numerical: <Hash size={14} />,
};

const typeBadge: Record<QuestionType, 'violet' | 'blue' | 'green'> = {
  mcq: 'violet',
  subjective: 'blue',
  numerical: 'green',
};

interface QuestionCardProps {
  question: Question;
  index: number;
  onChange: (q: Question) => void;
  onRemove: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(true);

  const updateType = (type: QuestionType) => {
    const updated: Question = { ...question, type };
    if (type === 'mcq' && !updated.options) {
      updated.options = [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ];
      updated.correctAnswer = 'a';
    }
    if (type !== 'mcq') {
      updated.correctAnswer = '';
    }
    onChange(updated);
  };

  const updateOption = (optId: string, text: string) => {
    const opts = (question.options ?? []).map((o) =>
      o.id === optId ? { ...o, text } : o
    );
    onChange({ ...question, options: opts });
  };

  const addOption = () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const nextId = ids[(question.options?.length ?? 0)];
    const opts: MCQOption[] = [...(question.options ?? []), { id: nextId, text: '' }];
    onChange({ ...question, options: opts });
  };

  const removeOption = (optId: string) => {
    const opts = (question.options ?? []).filter((o) => o.id !== optId);
    onChange({ ...question, options: opts });
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-800/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-600/20 text-violet-400 text-xs font-bold shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate">
            {question.text || <span className="text-gray-600 italic">Question text not set</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={typeBadge[question.type]}>
            <span className="flex items-center gap-1">
              {typeIcons[question.type]}
              {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
            </span>
          </Badge>
          <Badge variant="gray">{question.marks} marks</Badge>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {expanded ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <CardBody className="border-t border-gray-800 space-y-4 !pt-4">
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Question Type"
              value={question.type}
              onChange={(e) => updateType(e.target.value as QuestionType)}
            >
              <option value="mcq">MCQ</option>
              <option value="subjective">Subjective</option>
              <option value="numerical">Numerical</option>
            </Select>
            <Input
              label="Marks"
              type="number"
              min={1}
              max={20}
              value={question.marks}
              onChange={(e) => onChange({ ...question, marks: parseInt(e.target.value) || 1 })}
            />
            <Input
              label="Subject (optional)"
              placeholder="e.g. Physics"
              value={question.subject ?? ''}
              onChange={(e) => onChange({ ...question, subject: e.target.value })}
            />
          </div>

          <Textarea
            label="Question Text"
            rows={3}
            placeholder="Enter your question here..."
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
          />

          {/* MCQ Options */}
          {question.type === 'mcq' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Options & Correct Answer</label>
              {(question.options ?? []).map((opt) => (
                <div key={opt.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctAnswer === opt.id}
                      onChange={() => onChange({ ...question, correctAnswer: opt.id })}
                      className="accent-violet-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-400 w-4 text-center uppercase">
                      {opt.id}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder={`Option ${opt.id.toUpperCase()}`}
                    value={opt.text}
                    onChange={(e) => updateOption(opt.id, e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                  {(question.options?.length ?? 0) > 2 && (
                    <button
                      onClick={() => removeOption(opt.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
              {(question.options?.length ?? 0) < 6 && (
                <Button variant="ghost" size="sm" icon={<Plus size={13} />} onClick={addOption}>
                  Add Option
                </Button>
              )}
              <p className="text-xs text-gray-500">
                Select the radio button next to the correct answer.
              </p>
            </div>
          )}

          {/* Subjective / Numerical Answer */}
          {(question.type === 'subjective' || question.type === 'numerical') && (
            <Input
              label={question.type === 'numerical' ? 'Correct Answer (number)' : 'Model Answer / Keywords'}
              placeholder={
                question.type === 'numerical'
                  ? 'e.g. 9.8'
                  : 'e.g. Newton\'s second law, F = ma'
              }
              value={question.correctAnswer}
              onChange={(e) => onChange({ ...question, correctAnswer: e.target.value })}
            />
          )}
        </CardBody>
      )}
    </Card>
  );
};

export const CreateExam: React.FC = () => {
  const { addExam, setView } = useExamStore();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [timeMinutes, setTimeMinutes] = useState('30');
  const [questions, setQuestions] = useState<Question[]>([defaultQuestion()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Exam title is required';
    if (!subject.trim()) errs.subject = 'Subject is required';
    const mins = parseInt(timeMinutes);
    if (!mins || mins < 1) errs.time = 'Set a valid time limit';
    questions.forEach((q, i) => {
      if (!q.text.trim()) errs[`q_${i}`] = 'Question text missing';
      if (q.type === 'mcq') {
        const hasAllOptions = (q.options ?? []).every((o) => o.text.trim());
        if (!hasAllOptions) errs[`q_${i}_opts`] = 'Fill all options';
      }
      if (!q.correctAnswer.trim()) errs[`q_${i}_ans`] = 'Correct answer missing';
    });
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const exam: Exam = {
        id: uuidv4(),
        title: title.trim(),
        subject: subject.trim(),
        totalTime: parseInt(timeMinutes) * 60,
        questions,
        createdAt: new Date().toISOString(),
      };
      addExam(exam);
      setSaving(false);
      setView('exam-list');
    }, 400);
  };

  const updateQuestion = (index: number, q: Question) => {
    const updated = [...questions];
    updated[index] = q;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Exam Settings */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center">
            <BookOpen size={16} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-200">Exam Configuration</h2>
            <p className="text-xs text-gray-500">Set up the exam details and time limit</p>
          </div>
        </div>
        <CardBody className="grid grid-cols-2 gap-4">
          <Input
            label="Exam Title"
            placeholder="e.g. Physics — Mechanics Chapter 3"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
            error={errors.title}
            className="col-span-2"
          />
          <Input
            label="Subject"
            placeholder="e.g. Physics"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setErrors((p) => ({ ...p, subject: '' })); }}
            error={errors.subject}
          />
          <Input
            label="Time Limit (minutes)"
            type="number"
            min={1}
            max={300}
            placeholder="e.g. 30"
            value={timeMinutes}
            onChange={(e) => { setTimeMinutes(e.target.value); setErrors((p) => ({ ...p, time: '' })); }}
            error={errors.time}
          />
        </CardBody>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Questions', value: questions.length },
          { label: 'Total Marks', value: totalMarks },
          { label: 'Time Limit', value: `${timeMinutes || 0} min` },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center"
          >
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">Questions</h3>
          <Button
            variant="outline"
            size="sm"
            icon={<Plus size={13} />}
            onClick={() => setQuestions([...questions, defaultQuestion()])}
          >
            Add Question
          </Button>
        </div>

        {questions.map((q, i) => (
          <div key={q.id}>
            {errors[`q_${i}`] && (
              <p className="text-xs text-red-400 mb-1 px-1">Q{i + 1}: {errors[`q_${i}`]}</p>
            )}
            <QuestionCard
              question={q}
              index={i}
              onChange={(updated) => updateQuestion(i, updated)}
              onRemove={() => removeQuestion(i)}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between py-4 border-t border-gray-800">
        <Button variant="ghost" onClick={() => setView('exam-list')}>
          Cancel
        </Button>
        <div className="flex gap-3">
          <Button
            variant="primary"
            icon={<Save size={15} />}
            loading={saving}
            onClick={handleSave}
          >
            Save Exam
          </Button>
        </div>
      </div>
    </div>
  );
};
