import { useRef, useState } from "react";

type Props = {
  onAdd: (content: string) => Promise<void>;
  onClose: () => void;
};

/** 목표 아래에 뜨는 입력 줄. Enter로 추가하고 이어서 입력, Esc나 바깥 클릭이면 닫힌다 */
export default function AddTodo({ onAdd, onClose }: Props) {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const cancelled = useRef(false);

  async function submit() {
    const text = content.trim();
    if (!text || busy) return;
    setBusy(true);
    await onAdd(text);
    setContent("");
    setBusy(false);
  }

  return (
    <div className="todo adding">
      <input
        className="todo-edit"
        value={content}
        autoFocus
        placeholder="할 일 입력 후 Enter"
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => {
          if (!cancelled.current) void submit();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") void submit();
          if (e.key === "Escape") {
            cancelled.current = true;
            onClose();
          }
        }}
      />
      <span className="todo-check" aria-hidden />
    </div>
  );
}
