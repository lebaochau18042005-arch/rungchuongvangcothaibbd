import pptxgen from 'pptxgenjs';
import type { Question } from './gameStore';

const ANSWER_COLORS = ['FF4444', '3B82F6', 'F59E0B', '22C55E'];
const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

function difficultyLabel(d: string) {
  if (d === 'easy') return '🟢 Dễ';
  if (d === 'hard') return '🔴 Khó';
  return '🟡 Trung bình';
}

export async function exportQuestionsToPptx(
  questions: Question[],
  title: string,
): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE'; // 16:9

  // ===== Slide 1: Title =====
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '0F172A' };
  titleSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 3.0, w: '100%', h: 0.6, fill: { color: 'F97316' } });
  titleSlide.addText('RUNG CHUÔNG VÀNG', {
    x: 0.5, y: 0.8, w: 9.0, h: 1.2,
    fontSize: 54, bold: true, color: 'F97316', align: 'center', fontFace: 'Arial',
  });
  titleSlide.addText(title || 'Ngân hàng câu hỏi', {
    x: 0.5, y: 2.0, w: 9.0, h: 0.8,
    fontSize: 28, color: 'E2E8F0', align: 'center', fontFace: 'Arial',
  });
  titleSlide.addText(`Tổng số câu: ${questions.length}   |   ${new Date().toLocaleDateString('vi-VN')}`, {
    x: 0.5, y: 3.8, w: 9.0, h: 0.5,
    fontSize: 16, color: 'CBD5E1', align: 'center', fontFace: 'Arial', italic: true,
  });

  // ===== Question slides =====
  questions.forEach((q, idx) => {
    // --- Question slide ---
    const qSlide = pptx.addSlide();
    qSlide.background = { color: '0F172A' };

    // Top bar with question number
    qSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.55, fill: { color: 'F97316' } });
    qSlide.addText(`CÂU ${idx + 1} / ${questions.length}`, {
      x: 0.3, y: 0.08, w: 3, h: 0.38,
      fontSize: 16, bold: true, color: 'FFFFFF', fontFace: 'Arial',
    });
    qSlide.addText(`${q.subject}  •  ${difficultyLabel(q.difficulty)}`, {
      x: 6.0, y: 0.08, w: 3.7, h: 0.38,
      fontSize: 14, color: 'FFFFFF', fontFace: 'Arial', align: 'right',
    });

    // Question content
    qSlide.addText(q.content, {
      x: 0.4, y: 0.7, w: 9.2, h: 1.4,
      fontSize: 24, bold: true, color: 'F1F5F9',
      fontFace: 'Arial', valign: 'middle', wrap: true,
    });

    // Divider line
    qSlide.addShape(pptx.ShapeType.line, {
      x: 0.4, y: 2.1, w: 9.2, h: 0,
      line: { color: '334155', width: 1.5 },
    });

    // Answer options — 2x2 grid
    const positions = [
      { x: 0.3, y: 2.3, w: 4.6, h: 0.85 },
      { x: 5.1, y: 2.3, w: 4.6, h: 0.85 },
      { x: 0.3, y: 3.35, w: 4.6, h: 0.85 },
      { x: 5.1, y: 3.35, w: 4.6, h: 0.85 },
    ];

    q.options.forEach((opt, i) => {
      const pos = positions[i];
      const cleanOpt = opt.replace(/^[A-D][./):\- ]\s*/i, '').trim();
      const color = ANSWER_COLORS[i];

      qSlide.addShape(pptx.ShapeType.roundRect, {
        ...pos, fill: { color }, rectRadius: 0.12,
        line: { color: 'FFFFFF', width: 0.5, transparency: 60 },
      });
      qSlide.addText(`${ANSWER_LABELS[i]}. ${cleanOpt}`, {
        ...pos,
        fontSize: 16, bold: true, color: 'FFFFFF',
        fontFace: 'Arial', align: 'left', valign: 'middle',
        inset: 0.25,
      });
    });

    // --- Answer slide ---
    const aSlide = pptx.addSlide();
    aSlide.background = { color: '052E16' };

    aSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.55, fill: { color: '16A34A' } });
    aSlide.addText(`ĐÁP ÁN CÂU ${idx + 1}`, {
      x: 0.3, y: 0.08, w: 9.4, h: 0.38,
      fontSize: 16, bold: true, color: 'FFFFFF', fontFace: 'Arial',
    });

    // All options — highlight correct
    q.options.forEach((opt, i) => {
      const isCorrect = i === q.correctAnswer;
      const cleanOpt = opt.replace(/^[A-D][./):\- ]\s*/i, '').trim();
      aSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.4, y: 0.65 + i * 0.88, w: 9.2, h: 0.75,
        fill: { color: isCorrect ? '16A34A' : '1E293B' },
        rectRadius: 0.1,
        line: { color: isCorrect ? '4ADE80' : '334155', width: isCorrect ? 2. : 1 },
      });
      aSlide.addText(`${isCorrect ? '✓ ' : ''}${ANSWER_LABELS[i]}. ${cleanOpt}`, {
        x: 0.4, y: 0.65 + i * 0.88, w: 9.2, h: 0.75,
        fontSize: 18, bold: isCorrect, color: isCorrect ? 'FFFFFF' : '94A3B8',
        fontFace: 'Arial', inset: 0.3, valign: 'middle',
      });
    });

    // Explanation
    if (q.explanation) {
      const explY = 0.65 + 4 * 0.88;
      aSlide.addText(`💡 ${q.explanation}`, {
        x: 0.4, y: explY + 0.1, w: 9.2, h: 0.9,
        fontSize: 14, italic: true, color: '86EFAC',
        fontFace: 'Arial', wrap: true,
      });
    }
  });

  await pptx.writeFile({ fileName: `${title || 'cau-hoi'}-${Date.now()}.pptx` });
}
