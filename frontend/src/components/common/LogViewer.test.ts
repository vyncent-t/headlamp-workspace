import { findLongestLine } from './LogViewer'; // adjust path as needed

describe('findLongestLine', () => {
  it('handles simple lines', () => {
    expect(findLongestLine(['one line\n', 'other line\n'])).toBe(10);
  });

  it('splits on real LF (\\n) for a line', () => {
    expect(findLongestLine(['a\nbbb\nc'])).toBe(3);
  });

  it('splits on real LF (\\n) for a line - longer', () => {
    const logs = ['this is a long line that for', 'some reason\nwe split'];
    expect(findLongestLine(logs)).toBe(39);
  });

  it('splits on CRLF (\\r\\n) for a line', () => {
    expect(findLongestLine(['aa\r\nbbbb'])).toBe(4);
  });

  it('ignores literal "\\n" inside a line', () => {
    const logLines = ['foo\\nbar', 'mynewlongerstring\n'];
    expect(findLongestLine(logLines)).toBe(20);
  });

  it('returns 0 for empty input', () => {
    expect(findLongestLine([])).toBe(0);
  });
});
