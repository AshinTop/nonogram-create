const SIZE = 30
const THRESHOLD = 128
let currentGrid = []

const dropZone = document.getElementById('dropZone')
const imageInput = document.getElementById('imageInput')
const previewImage = document.getElementById('previewImage')
const hintText = document.getElementById('hintText')
const dropZoneNezha = document.getElementById('dropZoneNezha')

dropZoneNezha.addEventListener('click', (e) => {
  const img = new Image()
  img.crossOrigin = 'anonymous' // 关键设置
  img.onload = function () {
    processImage(img)
  }
  img.onerror = function () {
    console.error('图片加载失败，请检查CORS配置')
  }
  img.src = 'https://nonograms.numkid.com/assets/images/demo.jpeg'
})

// 点击拖拽区域触发文件选择
dropZone.addEventListener('click', () => imageInput.click())

imageInput.addEventListener('change', function (e) {
  const file = e.target.files[0]
  const reader = new FileReader()

  reader.onload = function (event) {
    const img = new Image()
    img.onload = function () {
      processImage(img)
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
})

function processImage(img) {
  const canvas = document.getElementById('preview')
  const ctx = canvas.getContext('2d')

  canvas.width = SIZE
  canvas.height = SIZE

  ctx.drawImage(img, 0, 0, SIZE, SIZE)
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE)
  const grid = []

  for (let y = 0; y < SIZE; y++) {
    const row = []
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4
      const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
      row.push(avg < THRESHOLD ? 1 : 0)
    }
    grid.push(row)
  }

  generateNonogram(grid)
}

function generateNonogram(grid) {
  currentGrid = JSON.parse(JSON.stringify(grid))
  const rowClues = grid.map((row) => getClue(row))
  const colClues = []

  for (let x = 0; x < SIZE; x++) {
    const col = grid.map((row) => row[x])
    colClues.push(getClue(col))
  }

  const container = document.getElementById('nonogramContainer')
  container.innerHTML = ''

  // 创建列提示
  const colNumbers = document.createElement('div')
  colNumbers.className = 'col-numbers'
  colClues.forEach((clue, x) => {
    const div = document.createElement('div')
    div.className = 'number'
    div.innerHTML = clue.map((n) => `<span>${n}</span>`).join('')
    if (x > 0) div.style.borderLeft = '1px solid transparent'
    colNumbers.appendChild(div)
  })
  container.appendChild(colNumbers)
  container.style.display = 'block'

  // 创建网格和行提示
  const gridDiv = document.createElement('div')
  gridDiv.className = 'grid'
  gridDiv.style.gridTemplateColumns = `repeat(${SIZE}, 25px)`

  // 创建行提示
  const rowNumbers = document.createElement('div')
  rowNumbers.className = 'row-numbers'
  grid.forEach((row, y) => {
    const div = document.createElement('div')
    div.className = 'number'
    div.textContent = rowClues[y].join(' ')
    rowNumbers.appendChild(div)
  })
  container.appendChild(rowNumbers)

  // 创建单元格
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      const cellDiv = document.createElement('div')
      cellDiv.className = 'cell'
      if (cell) cellDiv.classList.add('filled')
      cellDiv.addEventListener('click', () => {
        cellDiv.classList.toggle('filled')
        currentGrid[y][x] = cellDiv.classList.contains('filled') ? 1 : 0
        updateThumbnail()
      })
      gridDiv.appendChild(cellDiv)
    })
  })

  container.appendChild(gridDiv)
  updateThumbnail()
}

function getClue(arr) {
  const clue = []
  let count = 0

  for (const val of arr) {
    if (val) {
      count++
    } else if (count > 0) {
      clue.push(count)
      count = 0
    }
  }
  if (count > 0) clue.push(count)
  return clue.length ? clue : [0]
}

function updateThumbnail() {
  const canvas = document.getElementById('thumbnail')
  canvas.width = 200
  canvas.height = 200
  const ctx = canvas.getContext('2d')
  const cellSize = canvas.width / SIZE

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  currentGrid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        ctx.fillStyle = '#333'
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    })
  })
  canvas.style.display = 'block'
}
