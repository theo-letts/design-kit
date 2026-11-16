/* The kit's version, in the repository rather than in generated output.
 *
 *  It used to live in kit/package.json and be read back on each run so a
 *  regeneration would not reset it. That worked and was the wrong place: the
 *  folder is output, so the one number nobody could regenerate was being
 *  stored in the thing that gets deleted and rebuilt. Here it is in git,
 *  with the change that earned it.
 *
 *  Bump it when the exported CSS changes meaning — new tokens, different
 *  derivations, rules that behave differently. Not for a new kit preset,
 *  which changes values and not the contract. */
export const KIT_VERSION = "0.2.1";
