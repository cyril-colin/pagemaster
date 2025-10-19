import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import rxjsX from 'eslint-plugin-rxjs-x';
import tseslint from 'typescript-eslint';

const noUtilsHelperRule = {
    create(context) {
        return {
            ClassDeclaration(node) {
                const className = node.id.name;
                if (/Utils|Helper|Tool|Manager/i.test(className)) {
                    context.report({
                        node: node.id,
                        message: 'Avoid using "Utils", "Helper", "Tool" or "Manager" in class names. Create a more specific name instead.'
                    });
                }
            }
        };
    }
};

const allowTypeImportsForDocsRule = {
    create(context) {
        let sourceCode = context.sourceCode;
        return {
            ImportDeclaration(node) {
                const typeSpecifiers = node.specifiers.filter(spec => 
                    spec.importKind === 'type' || 
                    (spec.type === 'ImportSpecifier' && node.importKind === 'type')
                );
                
                if (typeSpecifiers.length === 0) {
                    return;
                }
                
                const comments = context.getSourceCode().getAllComments();
                const commentTexts = comments.map(comment => comment.value);
                
                typeSpecifiers.forEach(specifier => {
                    const importName = specifier.local.name;
                    
                    const isUsedInDocs = commentTexts.some(text => 
                        text.includes(`@link ${importName}`)
                    );
                    
                    if (isUsedInDocs) {
                        sourceCode.markVariableAsUsed(importName);
                    }
                });
            }
        };
    }
};

export default tseslint.config({
    files: [
      '**/*.ts'
    ],
    languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
            projectService: true,
            tsconfigRootDir: process.cwd(),
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
    },
    plugins: {
        '@stylistic': stylistic,
        'rxjs-x': rxjsX,
        '@angular-eslint': angular,
        'custom': {
            rules: {
                'no-utils-helper-names': noUtilsHelperRule,
                'doc-type-imports': allowTypeImportsForDocsRule
            }
        },
    },
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
        ],
        rules: {
            "no-restricted-globals": [
                'warn', 
                {
                    "name": "fdescribe",
                    "message": "Do not commit fdescribe. Use describe instead."
                },
                {
                    "name": "fit",
                    "message": "Do not commit fit. Use it instead."
                },
            ],
            "@typescript-eslint/no-restricted-imports": [
              "error",
              {
                "paths": [
                    {
                        "name": "@angular/core",
                        "importNames": ["Input"],
                        "message": "Please use signal based inputs"
                    },
                    {
                        "name": "@angular/core",
                        "importNames": ["Output"],
                        "message": "Please use signal based outputs"
                    },
                    {
                        "name": "@jsverse/transloco",
                        "importNames": ["TranslocoModule"],
                        "message": "TranslocoModule is not compatible with standalone context. Please use TranslocoDirective or TranslocoPipe instead."
                    },
                ]
              },
            ],
            'no-constant-binary-expression': 'off',
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/restrict-plus-operands': 'error',
            '@typescript-eslint/unbound-method': 'off', // Because we need it for Angular Reactive Form Validators: Validators.required
            'comma-dangle': [ 
                'warn', 
                {
                    arrays: 'always-multiline',
                    objects: 'always-multiline',
                    imports: 'always-multiline',
                    exports: 'always-multiline',
                    functions: 'always-multiline',
                } 
            ], // This avoid a git 'changed' status on the last line when we add a new line
            'max-len': ['warn', { code: 140, tabWidth: 4, ignoreComments: true }],
            indent: ['warn', 2, { SwitchCase: 1 }], // SwitchCase to 1 to avoid some lint conflicts 
            semi: ['warn', 'always'],
            quotes: ['warn', 'single'],
            'no-empty-function': 'off',
            // Avoid console.log
            'no-console': ['error', { 'allow': ['warn', 'error'] }],
            '@typescript-eslint/no-empty-function': 'off',

            'custom/doc-type-imports': 'error',
            'custom/no-utils-helper-names': 'error',

            // This rules make more comfortable copy/pasting some json object
            // in order to transform them into a TS interface.
            '@stylistic/member-delimiter-style': [
                'warn',
                {
                    'multiline': {
                        'delimiter': 'comma',
                        'requireLast': true
                    },
                    'singleline': {
                        'delimiter': 'comma',
                        'requireLast': false
                    }
                }
            ],

            // Angular rules
            '@angular-eslint/component-class-suffix': 'error',
            '@angular-eslint/directive-class-suffix': 'error',
            '@angular-eslint/no-inputs-metadata-property': 'error',
            '@angular-eslint/no-outputs-metadata-property': 'error', 
            '@angular-eslint/use-component-view-encapsulation': 'error',
            '@angular-eslint/prefer-standalone': 'error',
            '@angular-eslint/no-lifecycle-call': 'error', 
            '@angular-eslint/prefer-on-push-component-change-detection': 'error',

            // https://www.npmjs.com/package/eslint-plugin-rxjs
            'rxjs-x/finnish': 'off', // we put this on before, but it was a memory leak for VSCode
            'rxjs-x/no-exposed-subjects': [ 'error', { 'allowProtected': true } ], // Subjects must always be protected in a service. This ensure encapsulation of 'next()' method.
            'rxjs-x/no-subscribe-handlers': 'error', // Not using the 'pipe' on an observable is a bad practice
            'rxjs-x/no-floating-observables': 'error', // To avoid forgetting to subscribe();
            'rxjs-x/no-nested-subscribe': 'error', // To avoid nested subscribe()

            'rxjs-x/no-unbound-methods': 'error',
            'rxjs-x/no-unsafe-takeuntil': 'warn',
            'rxjs-x/no-unsafe-subject-next': 'error',
            
        },
    },
	{
		files: ['**/*.html'],
        plugins: {
          '@angular-eslint/template': angularTemplate
        },
        languageOptions: {
          parser: templateParser,
        },
		rules: {
            // Recommended templates rules 
            '@angular-eslint/template/banana-in-box': 'error',
            '@angular-eslint/template/no-negated-async': 'error',
            '@angular-eslint/template/eqeqeq': 'error', 
            '@angular-eslint/template/no-duplicate-attributes': 'error',
            '@angular-eslint/template/no-inline-styles': ['error', {
                allowNgStyle: true,
            }],

            // Personal templates rules
			'@angular-eslint/template/no-any': 'error', // Avoid any in templates
			'@angular-eslint/template/no-call-expression': 'off', // No risks since we force OnPush component @angular-eslint/prefer-on-push-component-change-detection
			'@angular-eslint/template/conditional-complexity': ['error', {
                    "maxComplexity": 3
                }
            ], // Avoid too much conditional complexity in html templates (like 4 || in ngIf)
		}
	},
);

