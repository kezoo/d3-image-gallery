<?php

$imagesDirPath = "images/";
$thumbPath = "thumbnail/";
$imageExt = array("jpg", "jpeg", "png", "gif", "bmp");

function Readir($dirpath) {
  $allFiles = scandir($dirpath);
  $files = array_diff($allFiles, array('.', '..'));
  return $files;
}

function FilterImages($d, $imageExt) {
  $newDir = $d;
  $pattern = '/\./';
  foreach ($newDir as $key => $value) {
    if (preg_match($pattern, $value)) {
      $newValue = explode('.', $value);
      $last = $newValue[count($newValue) - 1];
      $last = strtolower($last);
      if ( !in_array($last, $imageExt) ) {
        unset($newDir[$key]);
      }
    }
  }
  return $newDir;
}

function make_thumb( $src, $dest, $desired_width) {
  $file_name = basename($src);
  $ext   = pathinfo($file_name, PATHINFO_EXTENSION);
  $thumb_name = basename($file_name, ".$ext") . '_thumb.';
  $arr_image_details = getimagesize($src);
  $original_width = $arr_image_details[0];
  $original_height = $arr_image_details[1];
  $desired_height = floor($original_height * ($desired_width / $original_width));
  /* read the source image */
  if ( $arr_image_details[2] == 1) {
    $imgt = "ImageGIF";
    $imgcreatefrom = "ImageCreateFromGIF";
  }
  if ( $arr_image_details[2] == 2) {
    $imgt = "ImageJPEG";
    $imgcreatefrom = "ImageCreateFromJPEG";
  }
  if ( $arr_image_details[2] == 3) {
    $imgt = "ImagePNG";
    $imgcreatefrom = "ImageCreateFromPNG";
  }

  if ($imgt) {
    $source_image = $imgcreatefrom($src);
    $new_image = imagecreatetruecolor($desired_width, $desired_height);
    /* copy source image at a resized size */
    imagecopyresampled($new_image, $source_image, 0, 0, 0, 0, $desired_width, $desired_height, $original_width, $original_height);
    /* create the physical thumbnail image to its destination */
    $imgt($new_image, $dest . $thumb_name. $ext);
  }
}

$imagesArr = FilterImages(Readir($imagesDirPath), $imageExt);
$imagesResort = array();
$imagesMeta = array();

foreach ($imagesArr as $key => $value) {
  array_push($imagesResort, $value);
}

foreach ($imagesResort as $key => $value) {
  $ext = pathinfo($value, PATHINFO_EXTENSION);
  $path = $imagesDirPath . $value;
  list($width, $height) = getimagesize($path);
  $imgsize = filesize($path)/1000;
  make_thumb($path, $thumbPath, 80);
  $imagesMeta[] = array(
    "filename" => $value,
    "width" => $width,
    "height" => $height,
    "filesize" => $imgsize,
    "filepath" => $path,
    "thumbpath" => $thumbPath.basename($value, ".$ext") . '_thumb.'.$ext,
    "description" => "some description"
  );
}
$json = json_encode($imagesMeta);
file_put_contents('data.json', $json);
