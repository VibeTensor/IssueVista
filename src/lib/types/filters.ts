/**
 * Filter Type Definitions
 * Issue #121 - Advanced Search Filters with Boolean Operators
 *
 * Type definitions for the filter parser and visual filter builder.
 * Uses string literal unions instead of enums per TypeScript best practices.
 */

/**
 * Supported filter field types
 */
export type FilterType = 'label' | 'author' | 'state' | 'is' | 'assignee';

/**
 * Boolean operators for combining filters
 */
export type BooleanOperator = 'AND' | 'OR';

/**
 * Token types for the lexer
 */
export type TokenType =
  | 'FILTER' // label:value, author:username
  | 'NOT' // - prefix
  | 'AND' // AND keyword or implicit (space)
  | 'OR' // OR keyword or comma
  | 'LPAREN' // (
  | 'RPAREN' // )
  | 'EOF'; // End of input

/**
 * A single token from the lexer
 */
export interface FilterToken {
  type: TokenType;
  value: string;
  /** The filter field type if this is a FILTER token */
  filterType?: FilterType;
  /** The filter value if this is a FILTER token */
  filterValue?: string;
  /** Whether this filter is negated (has - prefix) */
  negated?: boolean;
  /** Start position in the input string */
  start: number;
  /** End position in the input string */
  end: number;
}

/**
 * AST node types for the parser
 */
export type ASTNodeType = 'filter' | 'not' | 'and' | 'or' | 'group';

/**
 * Base AST node interface
 */
export interface BaseASTNode {
  type: ASTNodeType;
}

/**
 * Filter AST node (leaf node)
 */
export interface FilterASTNode extends BaseASTNode {
  type: 'filter';
  filterType: FilterType;
  value: string;
  negated: boolean;
}

/**
 * NOT AST node (unary operator)
 */
export interface NotASTNode extends BaseASTNode {
  type: 'not';
  operand: ASTNode;
}

/**
 * AND AST node (binary operator)
 */
export interface AndASTNode extends BaseASTNode {
  type: 'and';
  left: ASTNode;
  right: ASTNode;
}

/**
 * OR AST node (binary operator)
 */
export interface OrASTNode extends BaseASTNode {
  type: 'or';
  left: ASTNode;
  right: ASTNode;
}

/**
 * Group AST node (parentheses)
 */
export interface GroupASTNode extends BaseASTNode {
  type: 'group';
  expression: ASTNode;
}

/**
 * Union type for all AST nodes
 */
export type ASTNode = FilterASTNode | NotASTNode | AndASTNode | OrASTNode | GroupASTNode;

/**
 * Represents a single filter chip in the UI
 */
export interface FilterChip {
  /** Unique identifier for the chip */
  id: string;
  /** The filter field type */
  filterType: FilterType;
  /** The filter value */
  value: string;
  /** Whether this filter is negated */
  negated: boolean;
  /** Display label for the chip */
  displayLabel: string;
}

/**
 * Result of parsing a filter query
 */
export interface ParseResult {
  /** Whether parsing was successful */
  success: boolean;
  /** The parsed AST (if successful) */
  ast?: ASTNode;
  /** Parsed filter chips for UI display */
  chips: FilterChip[];
  /** Error message (if parsing failed) */
  error?: string;
  /** Position of error in input (if parsing failed) */
  errorPosition?: number;
}

/**
 * Result of validating a filter query
 */
export interface ValidationResult {
  /** Whether the query is valid */
  isValid: boolean;
  /** The validated query string */
  query: string;
  /** Error message if invalid */
  error?: string;
}

/**
 * Filter state for the search form
 */
export interface AdvancedFilterState {
  /** Raw filter query string */
  query: string;
  /** Parsed filter chips */
  chips: FilterChip[];
  /** Whether the filter input is focused */
  isFocused: boolean;
  /** Whether the help tooltip is open */
  isHelpOpen: boolean;
}

/**
 * Props for FilterBuilder component
 */
export interface FilterBuilderProps {
  /** Current filter chips */
  chips: FilterChip[];
  /** Callback when chips change */
  onChipsChange: (chips: FilterChip[]) => void;
  /** Current filter query string */
  query: string;
  /** Callback when query changes */
  onQueryChange: (query: string) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Props for FilterHelpTooltip component
 */
export interface FilterHelpTooltipProps {
  /** Whether the tooltip is visible */
  show: boolean;
  /** Callback to close the tooltip */
  onClose: () => void;
}

/**
 * Supported filter types with their display labels
 */
export const FILTER_TYPE_LABELS: Record<FilterType, string> = {
  label: 'Label',
  author: 'Author',
  state: 'State',
  is: 'Is',
  assignee: 'Assignee'
};

/**
 * Valid values for state filter
 */
export const STATE_VALUES = ['open', 'closed'] as const;

/**
 * Valid values for is filter
 */
export const IS_VALUES = ['open', 'closed', 'issue', 'pr'] as const;

/**
 * Check if a string is a valid filter type
 */
export function isValidFilterType(type: string): type is FilterType {
  return ['label', 'author', 'state', 'is', 'assignee'].includes(type);
}

/**
 * Generate a unique ID for a filter chip
 */
export function generateChipId(): string {
  return `chip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
