<?php

namespace App\Services;

use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageProcessingService
{
    /**
     * Standard background colors commonly used for student & staff IDs
     */
    public const COLOR_WHITE = '#FFFFFF';

    public const COLOR_GREEN = '#166534'; // Passport / School studio green

    public const COLOR_BLUE = '#1D4ED8';  // Standard school badge blue

    /**
     * Process, crop to 1:1 aspect ratio, optionally adjust background, resize and store profile photo.
     *
     * @param  string  $destinationDir  'students' or 'staff'
     * @param  int  $targetSize  Target width & height (standard 500x500)
     * @param  string|null  $backgroundColor  Hex color (e.g. '#FFFFFF', '#166534') or 'white', 'green'
     * @return string Relative storage path in public disk
     */
    public function processProfilePhoto(
        UploadedFile|string $file,
        string $destinationDir = 'students',
        int $targetSize = 500,
        ?string $backgroundColor = null
    ): string {
        $filePath = $file instanceof UploadedFile ? $file->getRealPath() : $file;

        $imageInfo = @getimagesize($filePath);
        if (! $imageInfo) {
            // If GD cannot inspect image, fallback to standard store
            if ($file instanceof UploadedFile) {
                return $file->store($destinationDir, 'public');
            }
            throw new \InvalidArgumentException('Invalid image file provided.');
        }

        [$origW, $origH, $imageType] = $imageInfo;

        $sourceImage = $this->createImageFromType($filePath, $imageType);
        if (! $sourceImage) {
            if ($file instanceof UploadedFile) {
                return $file->store($destinationDir, 'public');
            }
            throw new \RuntimeException('Failed to load image for processing.');
        }

        // 1. Correct aspect ratio: compute centered 1:1 square crop box
        $cropSize = min($origW, $origH);
        $srcX = (int) max(0, ($origW - $cropSize) / 2);
        $srcY = (int) max(0, ($origH - $cropSize) / 2);

        // 2. Create destination truecolor canvas (targetSize x targetSize)
        $destImage = imagecreatetruecolor($targetSize, $targetSize);

        // Enable alpha blending and anti-aliasing
        imagealphablending($destImage, true);
        imageantialias($destImage, true);

        // 3. Handle background color if requested (e.g. white, green, blue)
        $rgb = $this->parseColor($backgroundColor);
        if ($rgb !== null) {
            $bgColor = imagecolorallocate($destImage, $rgb['r'], $rgb['g'], $rgb['b']);
            imagefilledrectangle($destImage, 0, 0, $targetSize, $targetSize, $bgColor);
        } else {
            // Default transparent/white canvas background
            $white = imagecolorallocate($destImage, 255, 255, 255);
            imagefilledrectangle($destImage, 0, 0, $targetSize, $targetSize, $white);
        }

        // 4. Resample cropped square into destination canvas
        imagecopyresampled(
            $destImage,
            $sourceImage,
            0,
            0,
            $srcX,
            $srcY,
            $targetSize,
            $targetSize,
            $cropSize,
            $cropSize
        );

        // 5. If background color was requested and source had uniform corners, replace backdrop
        if ($rgb !== null && $this->shouldReplaceBackdrop($sourceImage, $origW, $origH)) {
            $this->applyBackdropColor($destImage, $targetSize, $rgb);
        }

        // 6. Ensure destination directory exists on public disk
        $filename = sprintf('photo_%s_%s.jpg', uniqid(), time());
        $relativePath = $destinationDir.'/'.$filename;
        $absolutePath = Storage::disk('public')->path($relativePath);

        $dir = dirname($absolutePath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // 7. Save as high-quality JPEG (90% quality)
        imagejpeg($destImage, $absolutePath, 90);

        // 8. Clean up GD memory
        imagedestroy($sourceImage);
        imagedestroy($destImage);

        return $relativePath;
    }

    /**
     * Create GD image from file based on detected image type
     */
    protected function createImageFromType(string $filePath, int $imageType): ?GdImage
    {
        return match ($imageType) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($filePath) ?: null,
            IMAGETYPE_PNG => @imagecreatefrompng($filePath) ?: null,
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? (@imagecreatefromwebp($filePath) ?: null) : null,
            IMAGETYPE_GIF => @imagecreatefromgif($filePath) ?: null,
            default => null,
        };
    }

    /**
     * Check if corner colors are sufficiently uniform to indicate a backdrop
     */
    protected function shouldReplaceBackdrop(GdImage $image, int $w, int $h): bool
    {
        $tl = imagecolorat($image, 5, 5);
        $tr = imagecolorat($image, max(0, $w - 6), 5);

        $r1 = ($tl >> 16) & 0xFF;
        $g1 = ($tl >> 8) & 0xFF;
        $b1 = $tl & 0xFF;

        $r2 = ($tr >> 16) & 0xFF;
        $g2 = ($tr >> 8) & 0xFF;
        $b2 = $tr & 0xFF;

        $diff = abs($r1 - $r2) + abs($g1 - $g2) + abs($b1 - $b2);

        return $diff < 60;
    }

    /**
     * Simple flood-replace of outer backdrop if background color specified
     */
    protected function applyBackdropColor(GdImage $image, int $size, array $targetRgb): void
    {
        // Sample top edge backdrop color
        $topColor = imagecolorat($image, (int) ($size / 2), 5);
        $srcR = ($topColor >> 16) & 0xFF;
        $srcG = ($topColor >> 8) & 0xFF;
        $srcB = $topColor & 0xFF;

        $targetColor = imagecolorallocate($image, $targetRgb['r'], $targetRgb['g'], $targetRgb['b']);

        // Check if top color differs significantly from target color
        $colorDiff = abs($srcR - $targetRgb['r']) + abs($srcG - $targetRgb['g']) + abs($srcB - $targetRgb['b']);
        if ($colorDiff < 30) {
            return;
        }

        // Flood fill from corners if safe
        $tolerance = 35;
        $corners = [[0, 0], [$size - 1, 0]];
        foreach ($corners as [$cx, $cy]) {
            $c = imagecolorat($image, $cx, $cy);
            $cr = ($c >> 16) & 0xFF;
            $cg = ($c >> 8) & 0xFF;
            $cb = $c & 0xFF;
            if (abs($cr - $srcR) + abs($cg - $srcG) + abs($cb - $srcB) < $tolerance * 3) {
                // Safe edge replacement
                imagefill($image, $cx, $cy, $targetColor);
            }
        }
    }

    /**
     * Parse color name or hex into RGB array
     */
    public function parseColor(?string $color): ?array
    {
        if (! $color || $color === 'original') {
            return null;
        }

        $color = strtolower(trim($color));

        if ($color === 'white') {
            return ['r' => 255, 'g' => 255, 'b' => 255];
        }

        if ($color === 'green') {
            return ['r' => 22, 'g' => 101, 'b' => 52]; // #166534
        }

        if ($color === 'blue') {
            return ['r' => 29, 'g' => 78, 'b' => 216]; // #1d4ed8
        }

        // Handle hex like #ffffff or ffffff
        $hex = ltrim($color, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        if (strlen($hex) === 6 && ctype_xdigit($hex)) {
            return [
                'r' => hexdec(substr($hex, 0, 2)),
                'g' => hexdec(substr($hex, 2, 2)),
                'b' => hexdec(substr($hex, 4, 2)),
            ];
        }

        return null;
    }
}
