import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from '@typescript-eslint/experimental-utils'
import { strict as assert } from 'assert'

export default ESLintUtils.RuleCreator(
  () =>
    'https://github.com/votingworks/vxsuite/blob/main/libs/eslint-plugin-vx/docs/rules/gts-no-public-modifier.md'
)({
  name: 'gts-no-public-modifier',
  meta: {
    docs: {
      description:
        'Disallows use of `public` accessibility modifiers on class properties',
      category: 'Best Practices',
      recommended: 'error',
      suggestion: false,
      requiresTypeChecking: false,
    },
    fixable: 'code',
    messages: {
      noPublicModifier:
        'Do not use `public` modifier on class properties; they are already public by default',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],

  create(context) {
    const sourceCode = context.getSourceCode()

    function reportPublicToken(node: TSESTree.Node): void {
      const [publicToken, nextToken] = sourceCode.getFirstTokens(node, {
        count: 2,
      })
      assert.equal(publicToken?.value, 'public' as const)
      assert(nextToken)

      context.report({
        node: publicToken,
        messageId: 'noPublicModifier',
        fix: (fixer) =>
          fixer.removeRange([publicToken.range[0], nextToken.range[0]]),
      })
    }

    function processNode(
      node: TSESTree.ClassProperty | TSESTree.MethodDefinition
    ): void {
      if (node.accessibility === 'public') {
        reportPublicToken(node)
      }

      if (
        node.type === AST_NODE_TYPES.MethodDefinition &&
        node.key.type === AST_NODE_TYPES.Identifier &&
        node.key.name === 'constructor'
      ) {
        for (const param of node.value.params) {
          if (
            param.type === AST_NODE_TYPES.TSParameterProperty &&
            param.accessibility === 'public' &&
            param.readonly
          ) {
            reportPublicToken(param)
          }
        }
      }
    }

    return {
      ClassProperty: processNode,
      MethodDefinition: processNode,
    }
  },
})