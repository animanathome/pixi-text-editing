export const add = (a, b) => {
    return a + b;
}

// https://www.geeksforgeeks.org/closest-pair-of-points-using-divide-and-conquer-algorithm/
export const dist = (p1, p2) => {
    return Math.sqrt(
        (p1.x - p2.x) * (p1.x - p2.x) +
        (p1.y - p2.y) * (p1.y - p2.y)
    )
}

export const printVertexArray= (array) => {
    let count = 0;
    for (let i = 0; i < array.length / 2; i++) {
        let start = i * 2
        let end = start + 1;
        console.log(count++, 'x', array[start], 'y', array[end])
    }
}