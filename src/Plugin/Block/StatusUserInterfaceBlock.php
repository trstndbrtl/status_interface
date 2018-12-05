<?php

/**
 * @file
 * Contains \Drupal\football_database\Plugin\Block\ReactBlock.
 */

namespace Drupal\status_interface\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a block for ReactJs.
 *
 * @Block(
 *   id = "status_user_interface_block",
 *   admin_label = @Translation("Status User Interface Block")
 * )
 */
class StatusUserInterfaceBlock extends BlockBase {

  public function build() {
    return [
      'name' => [
        '#markup' => '<div id="app" data-title="Vous ne savez pas vivre mon petit..." data-nid="650"></div>',
      ],
       '#attached' => [
         'library' => [
            'status_interface/react-vendors',
            'status_interface/react-desktop',
         ],
       ],
    ];
  }
  
}
