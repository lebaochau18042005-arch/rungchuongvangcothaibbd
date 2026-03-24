import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType,
  ShadingType,
} from 'docx';
import type { Question } from './gameStore';

function difficultyLabel(d: string) {
  if (d === 'easy') return 'Dễ';
  if (d === 'hard') return 'Khó';
  return 'Trung bình';
}

export async function exportQuestionsToDocx(
  questions: Question[],
  title: string,
): Promise<void> {
  const now = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const COLORS = { orange: 'D97706', correct: '16A34A', wrong: '94A3B8', heading: '7C3AED' };

  const children: Paragraph[] = [];

  // ===== Title =====
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title || 'Ngân hàng câu hỏi', bold: true, color: COLORS.orange, size: 36 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Ngày xuất: ${now} — Tổng số câu: ${questions.length}`, color: '64748B', size: 22, italics: true })],
    }),
    new Paragraph({ text: '' }),
  );

  // ===== Questions =====
  questions.forEach((q, idx) => {
    const optLetters = ['A', 'B', 'C', 'D'];

    // Question heading
    children.push(
      new Paragraph({
        border: { bottom: { color: 'E2E8F0', style: BorderStyle.SINGLE, size: 4 } },
        children: [
          new TextRun({ text: `Câu ${idx + 1}. `, bold: true, color: COLORS.orange, size: 24 }),
          new TextRun({ text: q.content, bold: true, size: 24 }),
        ],
        spacing: { before: 240, after: 100 },
      }),
    );

    // Badge row
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Môn: ${q.subject}    Độ khó: ${difficultyLabel(q.difficulty)}`, size: 18, color: '64748B', italics: true }),
        ],
        spacing: { after: 80 },
      }),
    );

    // Options
    q.options.forEach((opt, i) => {
      const isCorrect = i === q.correctAnswer;
      const cleanOpt = opt.replace(/^[A-D][./):\- ]\s*/i, '').trim();
      children.push(
        new Paragraph({
          indent: { left: 360 },
          children: [
            new TextRun({
              text: `${optLetters[i]}. ${cleanOpt}`,
              bold: isCorrect,
              color: isCorrect ? COLORS.correct : '475569',
              size: 22,
            }),
            ...(isCorrect ? [new TextRun({ text: '  ✓ Đáp án đúng', bold: true, color: COLORS.correct, size: 20 })] : []),
          ],
          spacing: { after: 60 },
        }),
      );
    });

    // Explanation
    if (q.explanation) {
      children.push(
        new Paragraph({
          indent: { left: 360 },
          children: [
            new TextRun({ text: '💡 Giải thích: ', bold: true, color: '2563EB', size: 20 }),
            new TextRun({ text: q.explanation, italics: true, color: '334155', size: 20 }),
          ],
          spacing: { before: 60, after: 200 },
        }),
      );
    }
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title || 'cau-hoi'}-${Date.now()}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
