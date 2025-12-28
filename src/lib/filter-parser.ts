/**
 * Filter Parser
 * Issue #121 - Advanced Search Filters with Boolean Operators
 *
 * Implements a lexer and parser for GitHub-style filter queries with
 * Boolean operators (AND, OR, NOT) and parentheses for grouping.
 *
 * Syntax:
 * - Filters: label:value, author:username, state:open, is:issue, assignee:user
 * - AND: space between filters (implicit) or explicit "AND"
 * - OR: comma between filters or explicit "OR"
 * - NOT: - prefix (e.g., -label:bug)
 * - Grouping: parentheses (e.g., (label:bug OR label:feature) AND state:open)
 * - Quoted values: label:"good first issue" for values with spaces
 */

import {
  type FilterToken,
  type FilterType,
  type ASTNode,
  type FilterASTNode,
  type AndASTNode,
  type OrASTNode,
  type GroupASTNode,
  type ParseResult,
  type FilterChip,
  isValidFilterType,
  generateChipId
} from './types/filters';

/**
 * Lexer: Tokenizes the input string into tokens
 */
export function tokenize(input: string): FilterToken[] {
  const tokens: FilterToken[] = [];
  let pos = 0;

  const skipWhitespace = (): void => {
    while (pos < input.length && /\s/.test(input[pos]) && input[pos] !== ' ') {
      pos++;
    }
  };

  const readQuotedString = (): string => {
    const quote = input[pos];
    pos++; // Skip opening quote
    let value = '';
    while (pos < input.length && input[pos] !== quote) {
      if (input[pos] === '\\' && pos + 1 < input.length) {
        pos++; // Skip escape character
        value += input[pos];
      } else {
        value += input[pos];
      }
      pos++;
    }
    if (pos < input.length) {
      pos++; // Skip closing quote
    }
    return value;
  };

  const readWord = (): string => {
    let word = '';
    while (pos < input.length && !/[\s,():"]/.test(input[pos])) {
      word += input[pos];
      pos++;
    }
    return word;
  };

  while (pos < input.length) {
    skipWhitespace();
    if (pos >= input.length) break;

    const start = pos;
    const char = input[pos];

    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(', start, end: pos + 1 });
      pos++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')', start, end: pos + 1 });
      pos++;
      continue;
    }

    // Comma (OR operator)
    if (char === ',') {
      tokens.push({ type: 'OR', value: ',', start, end: pos + 1 });
      pos++;
      continue;
    }

    // Negation prefix
    if (char === '-') {
      // Look ahead to see if this is a negated filter
      const nextPos = pos + 1;
      if (nextPos < input.length && /[a-zA-Z]/.test(input[nextPos])) {
        pos++; // Skip the dash
        const word = readWord();
        const colonIndex = word.indexOf(':');

        if (colonIndex !== -1) {
          const filterType = word.substring(0, colonIndex);
          let filterValue = word.substring(colonIndex + 1);

          // Handle quoted values after colon
          if (pos < input.length && (input[pos] === '"' || input[pos] === "'")) {
            filterValue = readQuotedString();
          }

          if (isValidFilterType(filterType)) {
            tokens.push({
              type: 'FILTER',
              value: `-${filterType}:${filterValue}`,
              filterType: filterType as FilterType,
              filterValue,
              negated: true,
              start,
              end: pos
            });
            continue;
          }
        }
      }
      // If not a negated filter, treat as regular character
      pos = start;
    }

    // Space (AND operator) - but only if between filters
    if (char === ' ') {
      // Skip spaces and check if we need to add AND
      while (pos < input.length && input[pos] === ' ') {
        pos++;
      }
      // Only add AND if there's a token before and we're not at end
      if (tokens.length > 0 && pos < input.length) {
        const lastToken = tokens[tokens.length - 1];
        const nextChar = input[pos];
        // Add AND between filters, not after operators or before closing paren
        if (
          (lastToken.type === 'FILTER' || lastToken.type === 'RPAREN') &&
          nextChar !== ')' &&
          nextChar !== ',' &&
          nextChar.toUpperCase() !== 'O' // Not starting OR
        ) {
          // Check if next word is AND or OR
          const remaining = input.substring(pos).toUpperCase();
          if (!remaining.startsWith('AND') && !remaining.startsWith('OR')) {
            tokens.push({ type: 'AND', value: ' ', start: start, end: pos });
          }
        }
      }
      continue;
    }

    // Keywords and filters
    const word = readWord();
    if (word === '') {
      // Handle quoted string at start
      if (input[pos] === '"' || input[pos] === "'") {
        readQuotedString();
      }
      continue;
    }

    const upperWord = word.toUpperCase();

    // AND keyword
    if (upperWord === 'AND') {
      tokens.push({ type: 'AND', value: 'AND', start, end: pos });
      continue;
    }

    // OR keyword
    if (upperWord === 'OR') {
      tokens.push({ type: 'OR', value: 'OR', start, end: pos });
      continue;
    }

    // Filter (type:value)
    const colonIndex = word.indexOf(':');
    if (colonIndex !== -1) {
      const filterType = word.substring(0, colonIndex);
      let filterValue = word.substring(colonIndex + 1);

      // Handle quoted values after colon
      if (filterValue === '' && pos < input.length && (input[pos] === '"' || input[pos] === "'")) {
        filterValue = readQuotedString();
      }

      if (isValidFilterType(filterType)) {
        tokens.push({
          type: 'FILTER',
          value: `${filterType}:${filterValue}`,
          filterType: filterType as FilterType,
          filterValue,
          negated: false,
          start,
          end: pos
        });
        continue;
      }
    }

    // Unknown token - skip it
  }

  tokens.push({ type: 'EOF', value: '', start: pos, end: pos });
  return tokens;
}

/**
 * Parser: Parses tokens into an AST using precedence climbing
 * Operator precedence: NOT > AND > OR
 */
export function parseToAST(tokens: FilterToken[]): ASTNode | null {
  let pos = 0;

  const peek = (): FilterToken => tokens[pos] || { type: 'EOF', value: '', start: 0, end: 0 };
  const consume = (): FilterToken => tokens[pos++] || { type: 'EOF', value: '', start: 0, end: 0 };

  const parseAtom = (): ASTNode | null => {
    const token = peek();

    if (token.type === 'FILTER') {
      consume();
      return {
        type: 'filter',
        filterType: token.filterType!,
        value: token.filterValue!,
        negated: token.negated || false
      } as FilterASTNode;
    }

    if (token.type === 'LPAREN') {
      consume(); // consume '('
      const expr = parseOr();
      if (peek().type === 'RPAREN') {
        consume(); // consume ')'
      }
      if (expr) {
        return { type: 'group', expression: expr } as GroupASTNode;
      }
    }

    return null;
  };

  const parseAnd = (): ASTNode | null => {
    let left = parseAtom();
    if (!left) return null;

    while (peek().type === 'AND') {
      consume(); // consume AND
      const right = parseAtom();
      if (!right) break;
      left = { type: 'and', left, right } as AndASTNode;
    }

    return left;
  };

  const parseOr = (): ASTNode | null => {
    let left = parseAnd();
    if (!left) return null;

    while (peek().type === 'OR') {
      consume(); // consume OR
      const right = parseAnd();
      if (!right) break;
      left = { type: 'or', left, right } as OrASTNode;
    }

    return left;
  };

  return parseOr();
}

/**
 * Convert AST to GitHub search query syntax
 */
export function toGitHubQuery(ast: ASTNode): string {
  switch (ast.type) {
    case 'filter': {
      const filterNode = ast as FilterASTNode;
      const prefix = filterNode.negated ? '-' : '';
      const value = filterNode.value.includes(' ') ? `"${filterNode.value}"` : filterNode.value;
      return `${prefix}${filterNode.filterType}:${value}`;
    }

    case 'and': {
      const andNode = ast as AndASTNode;
      return `${toGitHubQuery(andNode.left)} ${toGitHubQuery(andNode.right)}`;
    }

    case 'or': {
      const orNode = ast as OrASTNode;
      return `${toGitHubQuery(orNode.left)},${toGitHubQuery(orNode.right)}`;
    }

    case 'group': {
      const groupNode = ast as GroupASTNode;
      return `(${toGitHubQuery(groupNode.expression)})`;
    }

    default:
      return '';
  }
}

/**
 * Extract filter chips from AST (flattened list for UI display)
 */
export function extractChips(ast: ASTNode): FilterChip[] {
  const chips: FilterChip[] = [];

  const traverse = (node: ASTNode): void => {
    switch (node.type) {
      case 'filter': {
        const filterNode = node as FilterASTNode;
        const displayLabel = filterNode.negated
          ? `NOT ${filterNode.filterType}:${filterNode.value}`
          : `${filterNode.filterType}:${filterNode.value}`;
        chips.push({
          id: generateChipId(),
          filterType: filterNode.filterType,
          value: filterNode.value,
          negated: filterNode.negated,
          displayLabel
        });
        break;
      }

      case 'and': {
        const andNode = node as AndASTNode;
        traverse(andNode.left);
        traverse(andNode.right);
        break;
      }

      case 'or': {
        const orNode = node as OrASTNode;
        traverse(orNode.left);
        traverse(orNode.right);
        break;
      }

      case 'group': {
        const groupNode = node as GroupASTNode;
        traverse(groupNode.expression);
        break;
      }
    }
  };

  traverse(ast);
  return chips;
}

/**
 * Main entry point: Parse a filter query string
 */
export function parseFilterQuery(input: string): ParseResult {
  if (!input || input.trim() === '') {
    return { success: true, chips: [] };
  }

  try {
    const tokens = tokenize(input);
    const ast = parseToAST(tokens);

    if (!ast) {
      return {
        success: false,
        chips: [],
        error: 'Invalid filter query',
        errorPosition: 0
      };
    }

    const chips = extractChips(ast);

    return {
      success: true,
      ast,
      chips
    };
  } catch (error) {
    return {
      success: false,
      chips: [],
      error: error instanceof Error ? error.message : 'Unknown parsing error',
      errorPosition: 0
    };
  }
}

/**
 * Convert filter chips to query string
 * Default operator between chips is AND
 */
export function chipsToQuery(chips: FilterChip[]): string {
  if (chips.length === 0) return '';

  return chips
    .map((chip) => {
      const prefix = chip.negated ? '-' : '';
      const value = chip.value.includes(' ') ? `"${chip.value}"` : chip.value;
      return `${prefix}${chip.filterType}:${value}`;
    })
    .join(' ');
}

/**
 * Validate a filter query string
 */
export function validateFilterQuery(input: string): { isValid: boolean; error?: string } {
  if (!input || input.trim() === '') {
    return { isValid: true };
  }

  const result = parseFilterQuery(input);

  if (!result.success) {
    return { isValid: false, error: result.error };
  }

  return { isValid: true };
}

/**
 * Get autocomplete suggestions for a partial query
 */
export function getFilterSuggestions(
  input: string,
  cursorPosition: number
): { suggestions: string[]; prefix: string } {
  const beforeCursor = input.substring(0, cursorPosition);
  const match = beforeCursor.match(/(\w+):?$/);

  if (!match) {
    // Suggest filter types
    return {
      suggestions: ['label:', 'author:', 'state:', 'is:', 'assignee:'],
      prefix: ''
    };
  }

  const prefix = match[1].toLowerCase();

  // Filter type suggestions
  const filterTypes = ['label', 'author', 'state', 'is', 'assignee'];
  const matchingTypes = filterTypes.filter((t) => t.startsWith(prefix));

  if (matchingTypes.length > 0 && !match[0].includes(':')) {
    return {
      suggestions: matchingTypes.map((t) => `${t}:`),
      prefix
    };
  }

  // Value suggestions based on filter type
  if (prefix === 'state' || beforeCursor.endsWith('state:')) {
    return {
      suggestions: ['open', 'closed'],
      prefix: ''
    };
  }

  if (prefix === 'is' || beforeCursor.endsWith('is:')) {
    return {
      suggestions: ['open', 'closed', 'issue', 'pr'],
      prefix: ''
    };
  }

  return { suggestions: [], prefix: '' };
}
