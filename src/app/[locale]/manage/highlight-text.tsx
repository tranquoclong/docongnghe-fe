export const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>

  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className='bg-yellow-200 dark:bg-yellow-800 text-inherit rounded-sm px-0'>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}
