import * as diff from 'diff';

export type DiffResult = {
  hasChanges: boolean;
  changesCount: number;
  addedLines: string[];
  removedLines: string[];
  changePercentage: number;
  summary: string;
};

/**
 * 2つのHTML（テキスト）を比較して差分を抽出
 */
export function compareContent(
  oldContent: string,
  newContent: string
): DiffResult {
  const changes = diff.diffLines(oldContent, newContent);

  const addedLines: string[] = [];
  const removedLines: string[] = [];
  let changesCount = 0;

  changes.forEach((part) => {
    if (part.added) {
      const lines = part.value.split('\n').filter((l) => l.trim().length > 0);
      addedLines.push(...lines);
      changesCount += lines.length;
    } else if (part.removed) {
      const lines = part.value.split('\n').filter((l) => l.trim().length > 0);
      removedLines.push(...lines);
      changesCount += lines.length;
    }
  });

  // 変更率を計算
  const totalLines = oldContent.split('\n').length;
  const changePercentage = totalLines > 0 ? (changesCount / totalLines) * 100 : 0;

  // サマリーを生成
  let summary = '';
  if (changesCount === 0) {
    summary = '変更なし';
  } else if (changePercentage < 5) {
    summary = '軽微な変更';
  } else if (changePercentage < 20) {
    summary = '中程度の変更';
  } else {
    summary = '大幅な変更';
  }

  return {
    hasChanges: changesCount > 0,
    changesCount,
    addedLines: addedLines.slice(0, 10), // 最大10行
    removedLines: removedLines.slice(0, 10),
    changePercentage: Math.round(changePercentage * 100) / 100,
    summary,
  };
}

/**
 * 差分から重要度を判定
 */
export function calculateImportance(diffResult: DiffResult): 'high' | 'medium' | 'low' {
  const { changePercentage, changesCount } = diffResult;

  // 大幅な変更 or 多数の変更
  if (changePercentage > 20 || changesCount > 50) {
    return 'high';
  }

  // 中程度の変更
  if (changePercentage > 5 || changesCount > 10) {
    return 'medium';
  }

  // 軽微な変更
  return 'low';
}

