export const searchSounds = async (query) => {
  const url = `https://freesound.org/apiv2/search/text/?query=${query}&fields=id,name,previews`
  const response = await fetch(url, {
    headers: { Authorization: `Token ${import.meta.env.VITE_FREESOUND_API_KEY}` }
  })
  if (!response.ok) throw new Error("Error fetching sounds")
  const data = await response.json()
  console.log("Freesound API response:", data) // <- para debug
  return data.results
}