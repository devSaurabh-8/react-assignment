
export const getArtworks = async (pageNo: number, limit = 12) => {
  try {
    const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNo}&limit=${limit}`)
    const data = await res.json()
    return data
  } catch (err) {
    console.error("Error fetching data:", err)
    return null
  }
}
