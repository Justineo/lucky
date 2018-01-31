export default function (content) {
  let [candidates = '', rounds = ''] = content.split('---')

  return {
    candidates: candidates
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        let [name, desc] = line.split('|')
        return {
          name,
          desc
        }
      }),
    rounds: rounds
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        let [title, count] = line.split('|')
        let normalizedCount = parseInt(count, 10)
        return {
          title,
          count: normalizedCount
        }
      })
  }
}
