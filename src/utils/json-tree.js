/**
 * constrcut 方法 格式化成树
 * construct 会自动过滤掉 null 和 undefined 值
 * 根据提供的 id, pid 和 children 将一个个节点构建成一棵或者多棵树
 * @param nodes 节点对象 数组，扁平化的数据
 * @param config 配置对象 生成结果中子节点的字段名，string 类型
 * id 数据里的 id，string 类型
 * pid 数据里的父 id，string 类型
 * children 生成结果中子节点的字段名，string 类型
 */

export function construct(nodes, config) {
    const id = (config && config.id) || 'id'
    const pid = (config && config.pid) || 'pid'
    const children = (config && config.children) || 'children'
    const idMap = {}
    const jsonTree = []
    nodes.forEach(v => {
        v && (idMap[v[id]] = v)
    })
    nodes.forEach(v => {
        if (v) {
            let parent = idMap[v[pid]]
            if (parent) {
                !parent[children] && (parent[children] = [])
                parent[children].push(v)
            } else {
                jsonTree.push(v)
            }
        }
    })
    return jsonTree
}
/**
 * destruct 方法 格式化成扁平数据
 * destruct 会自动过滤掉 null 和 undefined 值
 * 根据配置的 id, pid 和 children 把解构化的树型对象拆解为一个个节点
 * @param forest 单个或者多个树型对象 数组或者树型对象，结构化的数据
 * @param config 配置
 * id 数据里的 id，string 类型，默认为 'id'
 * pid 数据里添加的父 id 信息，string 类型，默认为 'pid'
 * children 生成结果中子节点的字段名，string 类型，默认为 'children'
 */

export function destruct(forest, config) {
    const id = (config && config.id) || 'id'
    const pid = (config && config.pid) || 'pid'
    const children = (config && config.children) || 'children'
    function flatTree(tree) {
        const queue = [tree]
        const result = []
        while (queue.length) {
            let currentNode = queue.shift()
            if (currentNode.hasOwnProperty(id)) {
                if (!currentNode.hasOwnProperty(pid)) {
                    currentNode = Object.assign(Object.assign({}, currentNode), { [pid]: null })
                }
                if (currentNode[children]) {
                    currentNode[children].forEach(v => {
                        v && queue.push(Object.assign(Object.assign({}, v), { [pid]: currentNode[id] }))
                    })
                }
                result.push(currentNode)
                delete currentNode[children]
            } else {
                throw new Error('you need to specify the [id] of the json tree')
            }
        }
        return result
    }
    if (Array.isArray(forest)) {
        return forest.map(v => flatTree(v)).reduce((pre, cur) => pre.concat(cur))
    } else {
        return flatTree(forest)
    }
}
export default {
    construct,
    destruct
}

// 用法
// import { construct, destruct } from '@/json-tree'

// const data = [
//     { id: 6, parent_id: 2, data: '这是其他数据' },
//     { id: 7, parent_id: 3, data: '这是其他数据' },
//     { id: 2, parent_id: 1, data: '这是其他数据' },
//     { id: 4, parent_id: 2, data: '这是其他数据' },
//     { id: 1, parent_id: 0, data: '这是其他数据' },
//     { id: 9, parent_id: 5, data: '这是其他数据' },
//     { id: 8, parent_id: 3, data: '这是其他数据' },
//     { id: 3, parent_id: 1, data: '这是其他数据' },
//     { id: 5, parent_id: 2, data: '这是其他数据' },
//     { id: 10, parent_id: 6, data: '这是其他数据' }
// ]

// const result = construct(data, {
//     id: 'id',
//     pid: 'parent_id',
//     children: 'kids'
// })

// console.log(JSON.stringify(result, null, '\t'))
