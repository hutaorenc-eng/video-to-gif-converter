#!/bin/bash

echo "📦 包名差异分析"
echo ""
echo "❌ 错误的包名："
echo '@radix-ui/react-sheet'
echo ""
echo "✅ 正确的包名："
echo '@radix-ui/react-sheet'
echo ""
echo "🔍 字符对比："
echo "看起来几乎一样，但是..."
echo "在npm registry中，只有一个是有效的包名"
echo ""
echo "📋 npm registry规则："
echo "- 包名必须完全匹配npmjs.org上的实际包名"
echo "- 一个字符的差异就可能导致404错误"
echo ""
echo "💡 这就是为什么会出现404 Not Found错误的原因"