var esniff = require("esniff"),
	i,
	current,
	literals,
	substitutions,
	sOut,
	sEscape,
	sAhead,
	sIn,
	sInEscape,
	template

sOut = function(char) {
	if (char === "\\") return sEscape
	if (char === "Δ") return sAhead
	current += char
	return sOut
}
sEscape = function(char) {
	if (char !== "\\" && char !== "Δ") current += "\\"
	current += char
	return sOut
}
sAhead = function(char) {
	if (char === "(") {
		literals.push(current)
		current = ""
		return sIn
	}
	if (char === "Δ") {
		current += "Δ"
		return sAhead
	}
	current += "Δ" + char
	return sOut
}
sIn = function(char) {
	var code = template.slice(i),
		end
	esniff(code, ")", function(j) {
		if (esniff.nest >= 0) return esniff.next()
		end = j
	})
	if (end != null) {
		substitutions.push(template.slice(i, i + end))
		i += end
		current = ""
		return sOut
	}
	end = code.length
	i += end
	current += code
	return sIn
}
sInEscape = function(char) {
	if (char !== "\\" && char !== ")") current += "\\"
	current += char
	return sIn
}

export default function(str) {
	var length, state, result
	current = ""
	literals = []
	substitutions = []

	template = String(str)
	length = template.length

	state = sOut
	for (i = 0; i < length; ++i) state = state(template[i])
	if (state === sOut) {
		literals.push(current)
	} else if (state === sEscape) {
		literals.push(current + "\\")
	} else if (state === sAhead) {
		literals.push(current + "Δ")
	} else if (state === sIn) {
		literals[literals.length - 1] += "Δ(" + current
	} else if (state === sInEscape) {
		literals[literals.length - 1] += "Δ(" + current + "\\"
	}
	result = { literals: literals, substitutions: substitutions }
	literals = substitutions = null
	return result
}
