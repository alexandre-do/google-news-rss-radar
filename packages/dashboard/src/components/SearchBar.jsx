export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="text"
        placeholder="Search articles…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
