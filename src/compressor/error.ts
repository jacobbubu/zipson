import { ERROR_TOKEN, ERROR_TOKEN_END } from "../constants";
import { Context, InvertedIndex, CompressOptions, Compressors } from "./common";
import { ZipsonWriter } from "./writer";

/**
 * Compress Error object to writer
 */
export function compressError(
  compressors: Compressors,
  context: Context,
  error: Error,
  invertedIndex: InvertedIndex,
  writer: ZipsonWriter,
  options: CompressOptions
) {
  writer.write(ERROR_TOKEN);
  compressors.string(compressors, context, error.message, invertedIndex, writer, options);
  writer.write(ERROR_TOKEN_END);
}
